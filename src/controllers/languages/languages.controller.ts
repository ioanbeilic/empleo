import { Body, ClassSerializerInterceptor, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { Authenticate, AuthenticatedUser, Authorize, User } from 'empleo-nestjs-authentication';
import { ApiKeycloakIdParam, KeycloakIdParams } from 'empleo-nestjs-common';
import { LanguageCreate } from '../../dto/language-create.dto';
import { Language } from '../../entities/language.entity';
import { LanguageNotFoundException } from '../../errors/language-not-found.exception';
import { PermissionsService } from '../../services/common/permissions.service';
import { LanguagesService } from '../../services/languages/languages.service';

const languageNotFoundException = new LanguageNotFoundException();

@Controller()
@ApiUseTags('languages')
@Authenticate()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService, private readonly permissionsService: PermissionsService) {}

  @Post(':keycloakId/languages')
  @Authorize.Candidates()
  @ApiKeycloakIdParam()
  @ApiOperation({ title: 'Create a Language stage, level is a number from 1 to 5 ' })
  @ApiOkResponse({ type: Language, description: 'Language stage successfully added' })
  @ApiBadRequestResponse({ description: 'The body did not pass the validation' })
  async createLanguage(
    @AuthenticatedUser() user: User,
    @Param() { keycloakId }: KeycloakIdParams,
    @Body() language: LanguageCreate
  ): Promise<Language> {
    this.permissionsService.isOwnerOrNotFound({ user, resource: { keycloakId } }, languageNotFoundException);

    return this.languagesService.createLanguage({ user, language });
  }
}
