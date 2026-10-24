import { IsEmail, IsIn, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsIn(['admin', 'asesor', 'repartidor'])
  rol: string;

  @IsNumber()
  empresa_id: number;
}
