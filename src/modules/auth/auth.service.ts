import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { PrismaService } from '../../database/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Prisma } from '../../generated/prisma/client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly defaultCustomerRole = 'customer';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: SignupDto): Promise<{ user: any; accessToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email is already registered');
    }

    const role = await this.getOrCreateDefaultRole();
    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        phone: body.phone,
        roleId: role.id,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: { select: { name: true } },
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    return { user, accessToken };
  }

  async login(body: LoginDto): Promise<{ user: any; accessToken: string }> {
    const email = body.email?.toLowerCase();
    const phone = body.phone;
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
      include: {
        role: {
          select: { name: true },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
      accessToken,
    };
  }

  async forgotPassword(
    body: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    const email = body.email?.toLowerCase();
    const phone = body.phone;
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
      select: { id: true, email: true },
    });

    // Keep response shape generic even when user is missing.
    if (!user) {
      return {
        message:
          'If the account exists, a password reset instruction has been generated.',
      };
    }

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        purpose: 'password_reset',
      },
      { expiresIn: '15m' },
    );

    return {
      message:
        'If the account exists, a password reset instruction has been generated.',
      resetToken,
    };
  }

  async resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(body.token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!payload?.sub || payload?.purpose !== 'password_reset') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(
    userId: string,
    body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      body.oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  async adminResetPassword(
    actorRole: string | undefined,
    body: AdminResetPasswordDto,
  ): Promise<{ message: string }> {
    if ((actorRole ?? '').toLowerCase() !== 'admin') {
      throw new ForbiddenException('Only admin can reset user password');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: body.targetUserId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'User password reset successfully by admin' };
  }

  private async getOrCreateDefaultRole(): Promise<{
    id: string;
    name: string;
  }> {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: this.defaultCustomerRole },
      select: { id: true, name: true },
    });

    if (existingRole) return existingRole;

    return this.prisma.role.create({
      data: {
        name: this.defaultCustomerRole,
        description: 'Default role for marketplace customers',
      } satisfies Prisma.RoleCreateInput,
      select: { id: true, name: true },
    });
  }
}
