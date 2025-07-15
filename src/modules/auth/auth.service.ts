import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private hash: HashService,
  ) {}

  /* ---------- Sign‑up ---------- */
  async register(dto: RegisterDto) {
    const password = await this.hash.hash(dto.password);
    const user = await this.users.create({ ...dto, password });
    const tokens = await this.issueTokens(user);
    const hash = await this.hash.hash(tokens.refresh_token);
    await this.users.update(user.id, { refresh_token_hash: hash });
    return {
      ...user,
      ...tokens,
    };
  }

  /* ---------- Login ---------- */
  async validateUser(username: string, pass: string) {
    const user = await this.users.findByUsername(username);
    if (!user) throw new UnauthorizedException();
    const ok = await this.hash.compare(pass, user.password);
    return ok ? user : null;
  }

  async login(user: User) {
    const tokens = await this.issueTokens(user);
    const hash = await this.hash.hash(tokens.refresh_token);
    await this.users.update(user.id, { refresh_token_hash: hash });
    return tokens;
  }

  /* ---------- Refresh ---------- */
  async refresh(userId: number) {
    const user = await this.users.findById(userId);
    const tokens = await this.issueTokens(user);
    user.refresh_token_hash = await this.hash.hash(tokens.refresh_token);
    await this.users.save(user); // rotate token
    return tokens;
  }

  /* ---------- Logout ---------- */
  async logout(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    user.refresh_token_hash = null; // clear token hash
    await this.users.save(user);
    return { message: 'Logged out successfully' };
  }

  /* ---------- Helpers ---------- */
  private async issueTokens(user: User) {
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwt.signAsync(payload);
    const refresh_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TTL,
    });
    return { access_token, refresh_token };
  }
}
