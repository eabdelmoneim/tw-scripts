import { isAddress } from "thirdweb/utils";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

async function validateAddresses(inputFilePath: string) {
  try {
    // Read the input CSV file
    const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      skip_empty_lines: true,
      trim: true
    });

    const invalidAddresses: string[] = [];

    // Validate each address
    for (let i = 0; i < records.length; i++) {
      const address = records[i][0]; // Assuming address is in the first column
      
      if (!isAddress(address)) {
        console.log(`Invalid address found: ${address}`);
        invalidAddresses.push(address);
      }
    }

    // If there are invalid addresses, write them to a file
    if (invalidAddresses.length > 0) {
      const outputContent = stringify(invalidAddresses.map(addr => [addr]));
      const outputPath = path.join(__dirname, 'invalid-addresses.csv');
      fs.writeFileSync(outputPath, outputContent);
      
      console.log(`\nFound ${invalidAddresses.length} invalid addresses`);
      console.log(`Invalid addresses have been written to: ${outputPath}`);
    } else {
      console.log('\nAll addresses are valid!');
    }

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