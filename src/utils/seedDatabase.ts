import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sampleNames } from '../data/sampleNames';

export const seedNamesDatabase = async (): Promise<void> => {
  try {
    // Check if names already exist
    const namesCollection = collection(db, 'names');
    const snapshot = await getDocs(namesCollection);
    
    if (snapshot.size > 0) {
      console.log('Names database already has data, skipping seed');
      return;
    }

    console.log('Seeding names database...');
    
    // Add sample names to Firestore
    const promises = sampleNames.map((name, index) => {
      const nameId = `name_${index.toString().padStart(3, '0')}`;
      return setDoc(doc(db, 'names', nameId), name);
    });

    await Promise.all(promises);
    console.log(`Successfully seeded ${sampleNames.length} names to the database`);
  } catch (error) {
    console.error('Error seeding names database:', error);
  }
};