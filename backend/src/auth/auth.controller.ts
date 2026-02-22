import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Public() // Endpoint de login deve ser público
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    forgotPassword(@Body('email') email: string) {
        // TODO: Implementar envio de e-mail real futuramente
        return { message: 'Se o e-mail existir no sistema, você receberá instruções em breve.' };
    }
}
