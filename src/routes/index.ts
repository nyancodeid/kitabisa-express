import { NextFunction, Request, Response } from "express";
import * as Joi from "joi";
import KitaBisa from "../../../kitabisa-api/dist/kitabisa";

export async function setCredential(req: Request, res: Response, next: NextFunction) {
  if (typeof req.body.authenticate === "undefined") {
    return res.status(400).json({ status: false, error: "AUTH_ERR" });
  }
  const [ email, password ] = req.body.authenticate.split(":");
  const kitaBisa = new KitaBisa();

  await kitaBisa.initialize({
    email,
    password,
  });

  // @ts-ignore
  req.kitaBisa = kitaBisa;

  next();
}
export async function userAuthentication(req: Request, res: Response) {
  const isSignedIn = await req.kitaBisa.isLogined();

  return sendResponse(req, res, {
    success: true,
    result: {
      login: isSignedIn,
    },
  });
}
export async function getBalance(req: Request, res: Response) {
  const balance = await req.kitaBisa.getBalance();

  return sendResponse(req, res, {
    success: true,
    result: balance,
  });
}
export async function getCampaigns(req: Request, res: Response) {
  const categories: number[] = req.body.categories.split(",").map((categorie: any) =>
    KitaBisa.categories[categorie.toUpperCase()]);
  const campaigns = await req.kitaBisa.getCampaign(categories);

  return sendResponse(req, res, {
    success: true,
    result: campaigns,
  });
}
export async function makeDonation(req: Request, res: Response) {
  const bodySchema = Joi.object({
    authenticate: Joi.string().required(),
    url: Joi.string().uri().required(),
    amount: Joi.number().min(4).required(),
    comment: Joi.string().optional().default(""),
    isAnonymous: Joi.boolean().optional().default(true),
  });

  const isValid = await bodySchema.validate(req.body);
  if (!isValid) {
    return sendResponse(req, res, { success: false, error: "INVALID_REQUEST", detail: isValid });
  }

  const { url, amount, comment, isAnonymous } = req.body;

  const result = await req.kitaBisa.makeDonation({
    url,
    amount,
    comment: (!comment) ? "" : comment,
    isAnonymous: (!isAnonymous) ? true : false,
    evidence: false,
  });

  return sendResponse(req, res, {
    success: true,
    result,
  });
}
export async function randomDonation(req: Request, res: Response) {
  const bodySchema = Joi.object({
    authenticate: Joi.string().required(),
    categories: Joi.string().required(),
    amount: Joi.number().min(4).required(),
    comment: Joi.string().optional().default(""),
    isAnonymous: Joi.boolean().optional().default(true),
  });

  const isValid = await bodySchema.validate(req.body);
  if (!isValid) {
    return sendResponse(req, res, { success: false, error: "INVALID_REQUEST", detail: isValid });
  }

  const { categories, amount, comment, isAnonymous } = req.body;

  const categoriesNumber: number[] = categories.split(",").map((categorie: any) =>
    KitaBisa.categories[categorie.toUpperCase()]);
  const campaigns = await req.kitaBisa.getCampaign(categoriesNumber);
  const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];

  const result = await req.kitaBisa.makeDonation({
    url: campaign.url,
    amount,
    comment: (!comment) ? "" : comment,
    isAnonymous: (!isAnonymous) ? true : false,
    evidence: false,
  });

  return sendResponse(req, res, {
    success: true,
    result,
  });
}

async function sendResponse(req: Request, res: Response, response: any) {
  res.json(response);

  return req.kitaBisa.close();
}
