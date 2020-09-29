import * as postService from "../services/post";
import { asyncHandler } from "../common/helpers";

export const get = asyncHandler(async function (req: any, res: any) {
    const posts = await postService.getPosts();
    return res.json({ success: true, data: posts });
})