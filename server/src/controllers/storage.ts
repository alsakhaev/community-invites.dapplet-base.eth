import * as storageService from "../services/storage";
import { asyncHandler } from "../common/helpers";

export const getTables = asyncHandler(async function (req: any, res: any) {
    const tables = await storageService.getTables();
    return res.json({ success: true, data: tables });
})