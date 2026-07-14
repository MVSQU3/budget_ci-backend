"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtpDto = exports.VerifyOtpDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const TELEPHONE_REGEX = /^\+\d{8,15}$/;
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: "Le nom d'utilisateur doit faire au moins 3 caractères" }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nomUtilisateur", void 0);
__decorate([
    (0, class_validator_1.Matches)(TELEPHONE_REGEX, { message: 'Téléphone au format international requis (ex. +2250701020304)' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Le mot de passe doit faire au moins 6 caractères' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "motDePasse", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.Matches)(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' }),
    __metadata("design:type", String)
], LoginDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "motDePasse", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, class_validator_1.Matches)(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 4, { message: 'Le code doit faire 4 chiffres' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "code", void 0);
class ResendOtpDto {
}
exports.ResendOtpDto = ResendOtpDto;
__decorate([
    (0, class_validator_1.Matches)(TELEPHONE_REGEX, { message: 'Téléphone au format international requis' }),
    __metadata("design:type", String)
], ResendOtpDto.prototype, "telephone", void 0);
//# sourceMappingURL=auth.dto.js.map