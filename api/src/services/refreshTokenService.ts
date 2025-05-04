import { pool } from '../config/dbConfig';

// Service pour gérer les tokens de rafraîchissement
export const refreshTokenService = {
    async save(tokenId: string, userId: string, expiresAt: Date): Promise<void> {
        await pool.request()
            .input('tokenId', tokenId)
            .input('userId', userId)
            .input('expiresAt', expiresAt)
            .query(`
                INSERT INTO RefreshTokens (tokenId, userId, expiresAt)
                VALUES (@tokenId, @userId, @expiresAt)
            `);
    },

    async revoke(tokenId: string): Promise<void> {
        await pool.request()
            .input('tokenId', tokenId)
            .query(`
                UPDATE RefreshTokens 
                SET isRevoked = 1, revokedAt = GETDATE()
                WHERE tokenId = @tokenId
            `);
    },

    async findValidToken(tokenId: string): Promise<any> {
        const result = await pool.request()
            .input('tokenId', tokenId)
            .query(`
                SELECT * FROM RefreshTokens 
                WHERE tokenId = @tokenId 
                AND isRevoked = 0 
                AND expiresAt > GETDATE()
            `);
        return result.recordset[0];
    }
};
