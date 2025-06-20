import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { checkToken } from '../../scr/middleware/authMiddleware.js';

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkToken', () => {
    it('should call next() when valid token is provided', () => {
      const token = 'valid.token.here';
      mockReq.headers.authorization = `Bearer ${token}`;
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: '123' });

      checkToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
      expect(mockReq.userId).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', () => {
      checkToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'Acesso não autorizado. Por favor, faça login.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', () => {
      const token = 'invalid.token.here';
      mockReq.headers.authorization = `Bearer ${token}`;
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      checkToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'Token inválido. Por favor, faça login novamente.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 