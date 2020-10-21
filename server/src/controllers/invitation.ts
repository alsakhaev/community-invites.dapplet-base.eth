import * as invitationService from "../services/invitation";
import { asyncHandler } from "../common/helpers";

export const getMyInvitations = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    if (!namespace || !username) throw new Error('namespace, username are required');
    const data = await invitationService.getInvitations(namespace, username);
    return res.json({ success: true, data });
})