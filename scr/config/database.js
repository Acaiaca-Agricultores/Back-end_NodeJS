import mongoose from "mongoose";

export default async function connectDB() {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASS;
    const dbName = process.env.DB_NAME
    try {
        await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.dsfgq3p.mongodb.net/${dbName}`);
        console.log("Connected to MongoDB");
        // Remover índice 'id_1' se existir
        try {
            const collection = mongoose.connection.db.collection("users");
            const indexes = await collection.indexes();
            const idIndex = indexes.find((i) => i.name === "id_1");
            if (idIndex) {
                await collection.dropIndex("id_1");
                console.log("Índice 'id_1' removido com sucesso.");
            }
        } catch (error) {
            console.error("Erro ao remover índice 'id_1':", error);
        }
    } catch (err) {
        console.error("Erro na conexão com o MongoDB:", err);
        throw err;
    }
}
