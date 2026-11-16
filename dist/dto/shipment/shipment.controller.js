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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const common_1 = require("@nestjs/common");
const shipment_service_1 = require("./shipment.service");
const shipment_dto_1 = require("./shipment.dto");
let ShipmentController = class ShipmentController {
    shipmentService;
    constructor(shipmentService) {
        this.shipmentService = shipmentService;
    }
    findAll() {
        return this.shipmentService.findAll();
    }
    async findOne(id) {
        const shipment = await this.shipmentService.findOne(id);
        if (!shipment)
            throw new common_1.NotFoundException(`Shipment ${id} not found`);
        return shipment;
    }
    create(dto) {
        return this.shipmentService.create(dto);
    }
    async update(id, dto) {
        const shipment = await this.shipmentService.update(id, dto);
        if (!shipment)
            throw new common_1.NotFoundException(`Shipment ${id} not found`);
        return shipment;
    }
    async delete(id) {
        await this.shipmentService.delete(id);
    }
};
exports.ShipmentController = ShipmentController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shipment_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, shipment_dto_1.UpdateShipmentDto]),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "delete", null);
exports.ShipmentController = ShipmentController = __decorate([
    (0, common_1.Controller)('shipment'),
    __metadata("design:paramtypes", [shipment_service_1.ShipmentService])
], ShipmentController);
//# sourceMappingURL=shipment.controller.js.map