import * as postService from "../services/post";
import { asyncHandler } from "../common/helpers";

export const get = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const posts = await postService.getPosts(namespace, username);
    return res.json({ success: true, data: posts });
})

export const getDetailed = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const posts = await postService.getMyDetailedPosts(namespace, username);
    return res.json({ success: true, data: posts });
})