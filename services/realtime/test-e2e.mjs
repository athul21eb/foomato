import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = 'dklsjfoiwjeflsndofj';
const WS_URL = 'http://localhost:5004';
const GRPC_URL = '127.0.0.1:50054';

// 1. Generate test JWT
const testPayload = {
  sub: 'user_test_999',
  email: 'test@foomato.local',
  role: 'seller',
  restaurantId: 'seller_test_555',
};
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });

console.log('🔑 Generated test JWT token');

// 2. Load gRPC Client
const packageDefinition = protoLoader.loadSync(
  join(__dirname, 'src/proto/realtime.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  },
);
const proto = grpc.loadPackageDefinition(packageDefinition);
const RealtimeService = proto.realtime.RealtimeService;
const client = new RealtimeService(
  GRPC_URL,
  grpc.credentials.createInsecure(),
);

console.log('📡 Connecting Socket.IO client to', WS_URL);
const socket = io(WS_URL, {
  auth: { token, sellerId: 'seller_test_555' },
  transports: ['websocket'],
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
  process.exit(1);
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully! Socket ID:', socket.id);

  let restaurantEventReceived = false;
  let userEventReceived = false;
  let sellerEventReceived = false;

  const checkDone = () => {
    if (restaurantEventReceived && userEventReceived && sellerEventReceived) {
      console.log('🎉 ALL REALTIME gRPC -> SOCKET.IO (Room, User, Seller) TESTS PASSED SUCCESSFULLY!');
      socket.disconnect();
      client.close();
      process.exit(0);
    }
  };

  socket.on('order:rider_assigned', (data) => {
    console.log('📬 [Socket Received] "order:rider_assigned":', data);
    if (data.orderId === 'ord_123' && data.riderName === 'Alex') {
      restaurantEventReceived = true;
      checkDone();
    }
  });

  socket.on('order:status_updated', (data) => {
    console.log('📬 [Socket Received] "order:status_updated":', data);
    if (data.status === 'in_kitchen') {
      userEventReceived = true;
      checkDone();
    }
  });

  socket.on('order:new_order', (data) => {
    console.log('📬 [Socket Received] "order:new_order":', data);
    if (data.orderId === 'ord_999') {
      sellerEventReceived = true;
      checkDone();
    }
  });

  // Trigger gRPC calls after short delay
  setTimeout(() => {
    console.log('🚀 Triggering gRPC EmitToRoom (restaurant:seller_test_555)...');
    client.EmitToRoom(
      {
        room: 'restaurant:seller_test_555',
        event: 'order:rider_assigned',
        payload_json: JSON.stringify({ orderId: 'ord_123', riderName: 'Alex' }),
      },
      (err, res) => {
        if (err) {
          console.error('❌ gRPC EmitToRoom error:', err);
          process.exit(1);
        }
        console.log('✅ gRPC EmitToRoom response:', res);
      },
    );

    console.log('🚀 Triggering gRPC EmitToUser (user_test_999)...');
    client.EmitToUser(
      {
        user_id: 'user_test_999',
        event: 'order:status_updated',
        payload_json: JSON.stringify({ status: 'in_kitchen' }),
      },
      (err, res) => {
        if (err) {
          console.error('❌ gRPC EmitToUser error:', err);
          process.exit(1);
        }
        console.log('✅ gRPC EmitToUser response:', res);
      },
    );

    console.log('🚀 Triggering gRPC EmitToSeller (seller_test_555)...');
    client.EmitToSeller(
      {
        seller_id: 'seller_test_555',
        event: 'order:new_order',
        payload_json: JSON.stringify({ orderId: 'ord_999', total: 450 }),
      },
      (err, res) => {
        if (err) {
          console.error('❌ gRPC EmitToSeller error:', err);
          process.exit(1);
        }
        console.log('✅ gRPC EmitToSeller response:', res);
      },
    );
  }, 500);
});

setTimeout(() => {
  console.error('❌ Test timed out waiting for socket events!');
  process.exit(1);
}, 8000);
