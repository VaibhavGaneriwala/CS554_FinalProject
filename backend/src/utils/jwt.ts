import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { IJWTPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'a266d1f9d21742880b3bdc9372f81b5d';
const JWT_EXPIRE: string = process.env.JWT_EXPIRES_IN || '7d';

export const jwtUtils = {
    generateToken(payload: IJWTPayload) : string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE } as SignOptions);
    },
    verifyToken(token: string) : IJWTPayload | null{
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    },
    decodeToken(token: string) : JwtPayload | null{
        try {
            const decoded = jwt.decode(token) as JwtPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    },
};

export default jwtUtils;