import KitaBisa from "../kitabisa-api/dist/kitabisa"

declare global {
  namespace Express {
    interface Request {
      kitaBisa?: KitaBisa;
    }
  }
}