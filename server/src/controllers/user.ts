import * as userService from "../services/user";
import { asyncHandler } from "../common/helpers";

export const getById = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.params;
    const user = await userService.getUser(namespace, username);
    return res.json({ success: true, data: user });
})

export const post = asyncHandler(async function (req: any, res: any) {
    const user = req.body;
    const conf = await userService.createUser(user);
    return res.json({ success: true, data: conf });
})

export const put = asyncHandler(async function (req: any, res: any) {
    const user = req.body;
    const conf = await userService.updateUser(user);
    return res.json({ success: true, data: conf });
})

