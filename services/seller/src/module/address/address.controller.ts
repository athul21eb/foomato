import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('address')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post(['', 'new'])
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Address added successfully')
  async addAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    const address = await this.addressService.addAddress(userId, dto);
    return { address };
  }

  @Get(['', 'all'])
  @ResponseMessage('Addresses fetched successfully')
  async getMyAddresses(@CurrentUser('id') userId: string) {
    const addresses = await this.addressService.getMyAddresses(userId);
    return { addresses };
  }

  @Put([':id', 'edit/:id'])
  @ResponseMessage('Address updated successfully')
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressService.updateAddress(userId, id, dto);
    return { address };
  }

  @Patch([':id/default', 'default/:id'])
  @ResponseMessage('Default address updated successfully')
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const address = await this.addressService.setDefaultAddress(userId, id);
    return { address };
  }

  @Delete(':id')
  @ResponseMessage('Address deleted successfully')
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.addressService.deleteAddress(userId, id);
    return { success: true };
  }
}
