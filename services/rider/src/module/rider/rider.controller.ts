import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RiderService } from './rider.service';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RiderGuard } from '../../common/guards/rider.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('rider')
export class RiderController {
  private readonly logger = new Logger(RiderController.name);

  constructor(private readonly riderService: RiderService) {}

  @Post('profile')
  @UseGuards(AuthGuard, RiderGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Rider profile created successfully')
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRiderProfileDto,
  ) {
    return this.riderService.createProfile(userId, dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ResponseMessage('Rider profile fetched successfully')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.riderService.getMyProfile(userId);
  }

  @Put('edit')
  @UseGuards(AuthGuard, RiderGuard)
  @ResponseMessage('Rider profile updated successfully')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRiderProfileDto,
  ) {
    return this.riderService.updateProfile(userId, dto);
  }

  @Patch('availability')
  @UseGuards(AuthGuard, RiderGuard)
  @ResponseMessage('Rider availability updated successfully')
  async toggleAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleAvailabilityDto,
  ) {
    return this.riderService.toggleAvailability(userId, dto);
  }

  @Post('order/:orderId/accept')
  @UseGuards(AuthGuard, RiderGuard)
  @ResponseMessage('Order accepted successfully')
  async acceptOrder(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    this.logger.log(`Accept order request received for order: ${orderId} by user: ${userId}`);
    return this.riderService.acceptOrder(userId, orderId);
  }

  @Get('order/current')
  @UseGuards(AuthGuard, RiderGuard)
  @ResponseMessage('Current order fetched successfully')
  async getCurrentOrder(@CurrentUser('id') userId: string) {
    return this.riderService.getCurrentOrder(userId);
  }

  @Patch('order/:orderId/status')
  @UseGuards(AuthGuard, RiderGuard)
  @ResponseMessage('Order status updated successfully')
  async updateOrderStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    this.logger.log(`Update order status request received for order: ${orderId} by user: ${userId}`);
    return this.riderService.updateOrderStatus(userId, orderId);
  }
}
