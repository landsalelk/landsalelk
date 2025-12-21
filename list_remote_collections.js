const { execSync } = require('child_process');

try {
    const output = execSync('appwrite databases list-collections --database-id landsalelkdb --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(output);

    console.log(`Total Collections: ${data.total}`);
    console.log('\nCollection IDs found in Appwrite Cloud:');
    data.collections.forEach(c => console.log(`  - ${c.$id} (${c.name})`));

} catch (e) {
    console.error('Error:', e.message);
}
