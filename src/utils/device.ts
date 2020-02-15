import { EThree } from '@virgilsecurity/e3kit'
import { request, GraphQLClient } from 'graphql-request'

const HOST = 'http://localhost:4000/graphql';
type Props = {
  identity: string;
  log: (title: string, value: string) => void;
  benchmarking?: boolean;
}
class Device {
  identity: string;
  benchmarking: boolean;
  log: (title: string, value: string) => void;
  authToken?: string;
  eThree?: EThree | null;

  constructor({ identity, log, benchmarking = false }: Props) {
    this.identity = identity;
    this.log = log;
    // setting this to true can cause a momentary hang in the browser
    // because encryption and decryption will be ran 100x each.
    this.benchmarking = benchmarking || false;
  }

  async initialize() {
    // authenticate
    const signInEmail = /* GraphQL */`
      mutation {
        signInEmail(
          email: "admin@gmail.com"
          password: "password"
        ) {
          token,
          user {
            email
          }
        }
      }
    `;

    const { signInEmail: signInData } = await request(HOST, signInEmail);
    this.authToken = signInData.token;


    // generate virgilJwt token callback
    async function getVirgilToken() {
      const createOrGetVirgilJwt = /* GraphQL */`
        query {
          virgilJwt
        }
      `;

      const authClient = new GraphQLClient(HOST, { headers: {
        Authorization: `Bearer ${signInData.authToken}`,
      }});
      const { virgilJwt } = await authClient.request(createOrGetVirgilJwt);
      return virgilJwt;
    }

      let eThree = null;
      const logTitle = 'Ethree Initialize';
      // try { 
      //   eThree = await EThree.initialize(getVirgilToken);
      //   this.log(logTitle, 'Initialized');
      // } catch(err) {
      //   this.log(logTitle, `Failed initializing: ${err}`);
      // }

      // this.eThree = eThree;
  }

  // getEThree() {
  //   const { eThree, identity } = this;
  //   if (!eThree) {
  //       throw new Error(`eThree not initialized for ${identity}`);
  //   }

  //   return eThree;
  // }

  // async register() {    
  //   const eThree = this.getEThree();

  //   try {
  //     //# start of snippet: e3kit_register
  //     await eThree.register();
  //     //# end of snippet: e3kit_register
  //     this.log(`Registered`);
  //   } catch(err) { 
  //       this.log(`Failed registering: ${err}`); 
  //       if (err.name === 'IdentityAlreadyExistsError') {
  //           await eThree.cleanup();
  //           await eThree.rotatePrivateKey();
  //           this.log(`Rotated private key instead`)
  //       }
  //   }
  // }

  // async findUsers(identities) {
  //     const eThree = this.getEThree();
  //     let findUsersResult = null;

  //     try {
  //         //# start of snippet: e3kit_find_users
  //         findUsersResult = await eThree.findUsers(identities)
  //         //# end of snippet: e3kit_find_users
  //         this.log(`Looked up ${identities}'s public key`);
  //     } catch(err) {
  //         this.log(`Failed looking up ${identities}'s public key: ${err}`);
  //     }

  //     return findUsersResult;
  // }

  // async encrypt(text, recipientPublicKey) {
  //     const eThree = this.getEThree();

  //     let encryptedText = null;
  //     let repetitions = this.benchmarking ? 100 : 1;

  //     const then = new Date;
  //     try {
  //         for (let i = 0; i < repetitions; i++) {
  //             //# start of snippet: e3kit_sign_and_encrypt
  //             encryptedText = await eThree.encrypt(text, recipientPublicKey);
  //             //# end of snippet: e3kit_sign_and_encrypt
  //         }
  //         let time = ((new Date) - then)/repetitions;
  //         this.log(`Encrypted and signed: '${encryptedText}'. Took: ${time}ms`);
  //     } catch(err) {
  //         this.log(`Failed encrypting and signing: ${err}`);
  //     }

  //     return encryptedText;
  // }

  // async decrypt(text, senderPublicKey) {
  //     const eThree = this.getEThree();

  //     let decryptedText = null;
  //     let repetitions = this.benchmarking ? 100 : 1;

  //     const then = new Date;
  //     try {
  //         for (let i = 0; i < repetitions; i++) {
  //             //# start of snippet: e3kit_decrypt_and_verify
  //             decryptedText = await eThree.decrypt(text, senderPublicKey);
  //             //# end of snippet: e3kit_decrypt_and_verify
  //         }
  //         let time = ((new Date) - then)/repetitions;
  //         this.log(`Decrypted and verified: '${decryptedText}'. Took: ${time}ms`);
  //     } catch(err) {
  //         this.log(`Failed decrypting and verifying: ${err}`);
  //     }

  //     return decryptedText;
  // }

  // async backupPrivateKey(password) {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_backup_private_key
  //         await eThree.backupPrivateKey(password);
  //         //# end of snippet: e3kit_backup_private_key
  //         this.log(`Backed up private key`);
  //     } catch(err) {
  //         this.log(`Failed backing up private key: ${err}`);
  //         if (err.name === 'CloudEntryExistsError') {
  //             await eThree.resetPrivateKeyBackup(password);
  //             this.log(`Reset private key backup. Trying again...`);
  //             await this.backupPrivateKey(password);
  //         }
  //     }
  // }

  // async changePassword(oldPassword, newPassword) {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_change_password
  //         await eThree.changePassword(oldPassword, newPassword);
  //         //# end of snippet: e3kit_change_password
  //         this.log(`Changed password`);
  //     } catch(err) {
  //         this.log(`Failed changing password: ${err}`);
  //     }
  // }

  // async restorePrivateKey(password) {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_restore_private_key
  //         await eThree.restorePrivateKey(password);
  //         //# end of snippet: e3kit_restore_private_key
  //         this.log(`Restored private key`);
  //     } catch(err) {
  //         this.log(`Failed restoring private key: ${err}`);
  //         if (err.name === 'PrivateKeyAlreadyExistsError') {
  //             await eThree.cleanup();
  //             this.log(`Cleaned up. Trying again...`);
  //             await this.restorePrivateKey(password);
  //         }
  //     }
  // }

  // async resetPrivateKeyBackup() {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_reset_private_key
  //         await eThree.resetPrivateKeyBackup();
  //         //# end of snippet: e3kit_reset_private_key
  //         this.log(`Reset private key backup`);
  //     } catch(err) {
  //         this.log(`Failed resetting private key backup: ${err}`);
  //     }
  // }

  // async hasLocalPrivateKey() {
  //     const eThree = this.getEThree();

  //     //# start of snippet: e3kit_has_local_private_key
  //     let hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
  //     //# end of snippet: e3kit_has_local_private_key

  //     return hasLocalPrivateKey;
  // }

  // async rotatePrivateKey() {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_rotate_private_key
  //         await eThree.rotatePrivateKey();
  //         //# end of snippet: e3kit_rotate_private_key
  //         this.log(`Rotated private key`);
  //     } catch(err) {
  //         this.log(`Failed rotating private key: ${err}`);

  //         if (err.name === 'PrivateKeyAlreadyExistsError') {
  //             await eThree.cleanup();
  //             this.log(`Cleaned up. Trying again...`);
  //             await this.rotatePrivateKey();
  //         }
  //     }
  // }

  // async cleanup() {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_cleanup
  //         await eThree.cleanup();
  //         //# end of snippet: e3kit_cleanup
  //         this.log(`Cleaned up`);
  //     } catch(err) {
  //         this.log(`Failed cleaning up: ${err}`);
  //     }
  // }

  // async unregister() {
  //     const eThree = this.getEThree();

  //     try {
  //         //# start of snippet: e3kit_unregister
  //         await eThree.unregister();
  //         //# end of snippet: e3kit_unregister
  //         this.log(`Unregistered`);
  //     } catch(err) {
  //         this.log(`Failed unregistering: ${err}`);
  //     }
  // }
}

export default Device;
