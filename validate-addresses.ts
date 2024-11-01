import { isAddress } from "thirdweb/utils";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

interface AddressCount {
  address: string;
  occurrences: number;
}

async function validateAddresses(inputFilePath: string) {
  try {
    // Read the input CSV file
    const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
    
    // Parse CSV content with headers
    const records = parse(fileContent, {
      skip_empty_lines: true,
      trim: true,
      columns: true
    });

    const invalidAddresses: string[] = [];
    const addressMap = new Map<string, number>();
    const uniqueAddresses = new Set<string>();

    // Validate each address and count occurrences
    for (const record of records) {
      const address = record.address;
      
      // Check if address is valid
      if (!address || !isAddress(address)) {
        console.log(`Invalid address found: ${address}`);
        invalidAddresses.push(address);
        continue;
      }

      // Count occurrences and add to unique set
      addressMap.set(address, (addressMap.get(address) || 0) + 1);
      uniqueAddresses.add(address);
    }

    // Find duplicates (addresses with more than 1 occurrence)
    const duplicates: AddressCount[] = [];
    addressMap.forEach((count, address) => {
      if (count > 1) {
        duplicates.push({ address, occurrences: count });
      }
    });

    // Write invalid addresses to file
    if (invalidAddresses.length > 0) {
      const outputContent = stringify(invalidAddresses.map(addr => [addr]), {
        header: true,
        columns: ['address']
      });
      const invalidPath = path.join(__dirname, 'invalid-addresses.csv');
      fs.writeFileSync(invalidPath, outputContent);
      
      console.log(`\nFound ${invalidAddresses.length} invalid addresses`);
      console.log(`Invalid addresses have been written to: ${invalidPath}`);
    } else {
      console.log('\nAll addresses are valid!');
    }

    // Write duplicate addresses to file
    if (duplicates.length > 0) {
      const duplicateContent = stringify(duplicates, {
        header: true,
        columns: ['address', 'occurrences']
      });
      const duplicatePath = path.join(__dirname, 'duplicate-addresses.csv');
      fs.writeFileSync(duplicatePath, duplicateContent);

      console.log(`\nFound ${duplicates.length} duplicate addresses`);
      console.log(`Duplicate addresses have been written to: ${duplicatePath}`);
    } else {
      console.log('\nNo duplicate addresses found!');
    }

    // Write unique addresses to file
    const uniqueContent = stringify([...uniqueAddresses].map(addr => ({ address: addr })), {
      header: true,
      columns: ['address']
    });
    const uniquePath = path.join(__dirname, 'unique-addresses.csv');
    fs.writeFileSync(uniquePath, uniqueContent);
    console.log(`\nUnique addresses have been written to: ${uniquePath}`);

    // Print summary
    const totalAddresses = records.length;
    const validAddresses = totalAddresses - invalidAddresses.length;
    console.log(`\nSummary:`);
    console.log(`Total addresses processed: ${totalAddresses}`);
    console.log(`Valid addresses: ${validAddresses}`);
    console.log(`Invalid addresses: ${invalidAddresses.length}`);
    console.log(`Duplicate addresses: ${duplicates.length}`);
    console.log(`Unique addresses: ${uniqueAddresses.size}`);

  } catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
  }
}

// Get input file path from command line argument or use default
const inputFile = process.argv[2] || path.join(__dirname, 'addresses.csv');

// Validate that input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

validateAddresses(inputFile).catch((error) => {
  console.error(error);
  process.exit(1);
}); 