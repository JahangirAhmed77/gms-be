import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

//   @Post('signup')
//   @ResponseMessage('user registered successfully')  
//   signup(@Body() dto: RegisterDto) {
//     return this.authService.signup(dto);
//   }

  @Post('login')
  @ApiOperation({ summary: 'login' })
  @ResponseMessage('user logged in successfully')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
