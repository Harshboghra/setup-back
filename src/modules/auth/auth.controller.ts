import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SkipAuth } from 'src/common/decorator/skip-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @SkipAuth()
  @Post('signup')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @SkipAuth()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req) {
    return this.auth.login(req.user);
  }

  @SkipAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(@Req() req) {
    return this.auth.refresh(req.user.userId);
  }
}
