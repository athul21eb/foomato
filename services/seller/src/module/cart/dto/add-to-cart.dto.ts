import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'sellerId must be a valid MongoDB ObjectId' })
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'itemId must be a valid MongoDB ObjectId' })
  itemId: string;
}
