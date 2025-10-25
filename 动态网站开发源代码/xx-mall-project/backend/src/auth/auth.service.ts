import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

type SanitizedUser = Omit<User, 'password'>;

interface RegisterPayload {
  username: string;
  password: string;
  email: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      isValidate: user.isValidate,
      addresses: user.addresses ?? [],
      orders: user.orders ?? [],
    };
  }

  async register(payload: RegisterPayload): Promise<SanitizedUser> {
    const { username, password, email } = payload;

    if (!username || !password || !email) {
      throw new BadRequestException('用户名、密码和邮箱不能为空');
    }

    const existingUser: User | null =
      await this.userService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已被占用');
    }

    const existingEmail: User | null =
      await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已被占用');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser: User = await this.userService.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.sanitizeUser(createdUser);
  }

  async login(
    payload: LoginPayload,
  ): Promise<{ access_token: string; user: SanitizedUser }> {
    const { username, password } = payload;

    if (!username || !password) {
      throw new BadRequestException('用户名和密码不能为空');
    }

    const user: User | null = await this.userService.findByUsername(username);

    if (!user || !user.password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payloadForToken: {
      sub: number;
      username: string | null;
      email: string | null;
    } = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payloadForToken);

    return {
      access_token: accessToken,
      user: this.sanitizeUser(user),
    };
  }
}
