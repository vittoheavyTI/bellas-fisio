import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SystemService } from './system.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums';

@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Roles(RoleEnum.OWNER)
    @Get('backup')
    downloadBackup(@Res() res: Response) {
        const filePath = this.systemService.getBackupPath();
        const fileName = this.systemService.getBackupFileName();

        res.download(filePath, fileName);
    }
}
