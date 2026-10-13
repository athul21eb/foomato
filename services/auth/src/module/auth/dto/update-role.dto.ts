import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/domain/user.entity';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
