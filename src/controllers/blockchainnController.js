import { provider, contract } from "../config/blockchain.js";
export const upload = async (req, res) => {
    try {
        const { signedTx } = req.body;
        if (!signedTx) {
            return res
                .status(400)
                .json({ error: "Missing signedTx" });
        }

        const txResponse =
            await provider.broadcastTransaction(signedTx);
        const receipt = await txResponse.wait();

        console.log("Status: ", receipt.status);
        const event = receipt.logs
            .map((log) => contract.interface.parseLog(log))
            .find((log) => log && log.name === "FileUploaded");

        res.json({
            transactionHash: txResponse.hash,
            fileId: event ? event.args.fileId : null,
            status: "success",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const retreiveById = async (req, res) => {
    try {
        const { signedTx } = req.body;

        if (!signedTx) {
            return res
                .status(400)
                .json({ message: "Missing signed tx" });
        }

        const txResponse =
            await provider.broadcastTransaction(signedTx);
        const receipt = await txResponse.wait();

        console.log("Status: ", receipt.status);

        let fileAccessedEvent = null;

        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog.name === "FileAccessed") {
                    fileAccessedEvent = parsedLog;

                    break;
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (!fileAccessedEvent) {
            return res
                .status(404)
                .json({ message: "FileAccessed event not found" });
        }

        const ipfsHash = fileAccessedEvent.args.ipfsHash;

        if (!ipfsHash) {
            return res
                .status(404)
                .json({ message: "Could not find the file" });
        }

        res.status(200).json({ ipfsHash });
    } catch (error) {
        console.error("Error retrieving file metadata, ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const retreiveAll = async (req, res) => {
    try {
        const { userAddress } = req.params;
        if (!userAddress) {
            return res
                .status(400)
                .json({ message: "Missing user address" });
        }
        const userFileIdsArr =
            await contract.getUserFiles(userAddress);
        console.log("Files: ", userFileIdsArr);
        if (!userFileIdsArr) {
            return res
                .status(404)
                .json({ message: "User files not found" });
        }

        const userFiles = await Promise.all(
            userFileIdsArr.map(async (fileId, index) => {
                console.log("FileId in userFilesArr[%d]:", index);

                const exists = await contract.fileExists(fileId);
                if (!exists) {
                    throw new Error(`File not found: ${fileId}`);
                }

                const data = await contract.getFileData(fileId);
                console.log("File Metadata:", data);
                return data;
            }),
        );
        const cleanedUserFiles = userFiles.map((file) => ({
            ipfsHash: file.ipfsHash,
            fileName: file.fileName,
            encryptionMethod: file.encryptionMethod,
            timestamp: file.timestamp.toString(),
        }));

        res.status(200).json({ userFiles: cleanedUserFiles });
    } catch (error) {
        console.error("Error fetching user files", error);
        return res
            .status(500)
            .json({ message: "Internal server error" });
    }
};
