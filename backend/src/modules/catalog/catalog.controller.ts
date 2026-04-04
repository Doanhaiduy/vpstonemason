import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('admin/tree')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'staff')
  getAdminTree() {
    return this.catalogService.getAdminTree();
  }

  @Get('admin/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'staff')
  getAdminItems(
    @Query('type') type?: string,
    @Query('parentId') parentId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.catalogService.getAdminItems({
      type,
      parentId,
      categoryId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      sort,
      includeInactive: includeInactive !== 'false',
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('admin/item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'staff')
  getAdminItemById(@Param('id') id: string) {
    return this.catalogService.getAdminItemById(id);
  }

  @Post('admin/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  createAdminItem(@Body() body: any) {
    return this.catalogService.createAdminItem(body);
  }

  @Patch('admin/item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  updateAdminItem(@Param('id') id: string, @Body() body: any) {
    return this.catalogService.updateAdminItem(id, body);
  }

  @Delete('admin/item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteAdminItem(@Param('id') id: string) {
    return this.catalogService.deleteAdminItem(id);
  }

  @Public()
  @Get()
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Public()
  @Get('tree')
  getTree() {
    return this.catalogService.getTree();
  }

  @Public()
  @Get('products')
  getProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('range') range?: string,
    @Query('finish') finish?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.catalogService.getProducts({
      search,
      category,
      range,
      finish,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      sort,
    });
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogService.getItemDetail(slug);
  }

  @Public()
  @Get(':slug/children')
  getChildren(@Param('slug') slug: string) {
    return this.catalogService.getChildren(slug);
  }

  @Public()
  @Get(':slug/breadcrumb')
  getBreadcrumb(@Param('slug') slug: string) {
    return this.catalogService.getBreadcrumb(slug);
  }
}
