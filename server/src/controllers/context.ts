import * as contextService from "../services/context";
import { asyncHandler } from "../common/helpers";

export const get = asyncHandler(async function (req: any, res: any) {
    const data = await contextService.getContexts();
    return res.json({ success: true, data: data });
})

export const getById = asyncHandler(async function (req: any, res: any) {
    const { id } = req.params;
    const data = await contextService.getContext(id);
    return res.json({ success: true, data: data });
})

export const create = asyncHandler(async function (req: any, res: any) {
    const c = req.body;
    const data = await contextService.registerContext(c);
    return res.json({ success: true, data: data });
})

export const getVariants = asyncHandler(async function (req: any, res: any) {
    const { id } = req.params;
    const data = await contextService.getContextVariantsByContextId(id);
    return res.json({ success: true, data: data });
})

export const getContextVariants = asyncHandler(async function (req: any, res: any) {
    const data = await contextService.getContextVariants();
    return res.json({ success: true, data: data });
})