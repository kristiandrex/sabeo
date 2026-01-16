import { createRankingImage } from "#/app/_og/ranking-image";

export { contentType, imageSize as size } from "#/app/_og/config";
export { alt } from "#/app/_og/ranking-image";

export const dynamic = "force-dynamic";

export default async function Image() {
  return createRankingImage();
}
