import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetNearbySellersDto } from './dto/get-nearby-sellers.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SellerGuard } from '../../common/guards/seller.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller(['seller'])
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post('new')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Seller profile created successfully')
  async addSeller(
    @CurrentUser('id') ownerId: string,
    @Body() createSellerDto: CreateSellerDto,
  ) {
    return this.sellerService.addSeller(ownerId, createSellerDto);
  }

  @Get('get-seller')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Seller profile retrieved successfully')
  async fetchMySeller(@CurrentUser('id') ownerId: string) {
    return this.sellerService.fetchMySeller(ownerId);
  }

  @Put('status')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Seller status updated successfully')
  async updateStatusSeller(
    @CurrentUser('id') ownerId: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.sellerService.updateStatusSeller(ownerId, updateStatusDto);
  }

  @Put('edit')
  @UseGuards(AuthGuard, SellerGuard)
  @ResponseMessage('Seller profile updated successfully')
  async updateSeller(
    @CurrentUser('id') ownerId: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return this.sellerService.updateSeller(ownerId, updateSellerDto);
  }

  // --- Public Routes ---

  @Get(['nearby'])
  @ResponseMessage('Nearby restaurants retrieved successfully')
  async getNearbyRestaurant(@Query() query: GetNearbySellersDto) {
    return this.sellerService.getNearbyRestaurants(query);
  }

  @Get(':id')
  @ResponseMessage('Restaurant retrieved successfully')
  async fetchSingleRestaurant(@Param('id') id: string) {
    return this.sellerService.fetchSingleRestaurant(id);
  }
}
