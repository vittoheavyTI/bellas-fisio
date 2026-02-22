import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SystemService {
    getBackupPath() {
        // Database path relative to project root
        const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

        if (!fs.existsSync(dbPath)) {
            throw new NotFoundException('Arquivo de banco de dados não encontrado.');
        }

        return dbPath;
    }

    getBackupFileName() {
        const date = new Date().toISOString().split('T')[0];
        return `bellas_fisio_backup_${date}.db`;
    }
}
