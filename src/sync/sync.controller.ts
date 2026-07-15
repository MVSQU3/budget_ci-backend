import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SyncService } from "./sync.service";
import { SyncDto } from "./dto/sync.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("sync")
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post()
  synchroniser(@Request() req: any, @Body() dto: SyncDto) {
    return this.sync.synchroniser(req.user.userId, dto);
  }
}
