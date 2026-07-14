import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    envoyer(telephone: string, message: string): Promise<void>;
}
