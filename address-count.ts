import * as fs from 'fs';
import * as path from 'path';

interface AddressData {
    address: string;
    maxClaimable: string;
}

function countAddresses(filePath: string): number {
    try {
        // Read the file
        const jsonData = fs.readFileSync(filePath, 'utf-8');

        // Parse the JSON data
        const addressArray: AddressData[] = JSON.parse(jsonData);

        // Return the count of addresses
        return addressArray.length;
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        return 0;
    }
}

// Usage
const filePath = path.join(__dirname, 'addresses.json');
const addressCount = countAddresses(filePath);
console.log(`Number of addresses: ${addressCount}`);