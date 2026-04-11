import { registerEnumType } from '@nestjs/graphql';

export enum ContentType {
	MOD = 'mod',
	RESOURCE_PACK = 'resourcepack',
	SHADER = 'shader',
	DATA_PACK = 'datapack',
	MODPACK = 'modpack',
}

registerEnumType(ContentType, { name: 'ContentType' });

/** Maps content type to the subdirectory within an instance */
export const CONTENT_DIRECTORIES: Record<ContentType, string> = {
	[ContentType.MOD]: 'mods',
	[ContentType.RESOURCE_PACK]: 'resourcepacks',
	[ContentType.SHADER]: 'shaderpacks',
	[ContentType.DATA_PACK]: 'world/datapacks',
	[ContentType.MODPACK]: '',
};
