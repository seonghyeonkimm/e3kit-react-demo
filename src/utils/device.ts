
import { request, GraphQLClient } from 'graphql-request'

// @ts-ignore
const EThree = (E3kit as any).EThree;
const HOST = 'http://localhost:4000/graphql';
type Props = {
  email: string;
  password: string;
  log: (title: string, value: string) => void;
  benchmarking?: boolean;
}
class Device {
  email: string;
  password: string;
  identity?: string;
  benchmarking: boolean;
  log: (title: string, value: string) => void;
  authToken?: string;
  eThree?: any | null;

  constructor({ email, password, log, benchmarking = false }: Props) {
    this.email = email;
    this.password = password;
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
          email: "${this.email}"
          password: "${this.password}"
        ) {
          token,
          user {
            id
            email
          }
        }
      }
    `;

    const { signInEmail: signInData } = await request(HOST, signInEmail);
    this.identity = signInData.user.id;
    this.authToken = signInData.token;


    // generate virgilJwt token callback
    async function getVirgilToken() {
      const createOrGetVirgilJwt = /* GraphQL */`
        query {
          virgilJwt
        }
      `;

      const authClient = new GraphQLClient(HOST, { headers: {
        Authorization: `Bearer ${signInData.token}`,
      }});
      const { virgilJwt } = await authClient.request(createOrGetVirgilJwt);
      return virgilJwt;
    }

      let eThree = null;
      const logTitle = '##### Ethree Initialize';
      try { 
        eThree = await EThree.initialize(getVirgilToken);
        this.log(logTitle, `${this.email} Initialized`);
      } catch(err) {
        this.log(logTitle, `Failed initializing: ${err}`);
      }

      this.eThree = eThree;
  }

  getEThree() {
    if (!this.eThree) {
        throw new Error(`eThree not initialized for ${this.email}`);
    }

    return this.eThree;
  }

  async register() {    
    const eThree = this.getEThree();

    const logTitle = '##### Register'
    try {
      //# start of snippet: e3kit_register
      // register virgil and generate and store public, private keys on device
      await eThree.register();
      //# end of snippet: e3kit_register
      this.log(logTitle, `${this.email} Registered`);
    } catch(err) { 
      this.log(logTitle, `${this.email} Failed registering: ${err}`); 
      if (err.name === 'IdentityAlreadyExistsError') {
          // logout user
          await eThree.cleanup();
          // publish new private key
          await eThree.rotatePrivateKey();
          this.log(logTitle, `${this.email} Rotated private key instead`)
      }
    }
  }

  async findUsers(identities: string[]) {
    const eThree = this.getEThree();
    let findUsersResult = null;

    const logTitle = '##### Find Users';
    try {
      // find users public information
      findUsersResult = await eThree.findUsers(identities)
      this.log(logTitle, `Looked up ${identities}'s public key`);
    } catch(err) {
      this.log(logTitle, `Failed looking up ${identities}'s public key: ${err}`);
    }

    return findUsersResult;
  }

  async encrypt(text: string, recipientPublicKey: any) {
    const eThree = this.getEThree();

    let encryptedText = null;
    let repetitions = this.benchmarking ? 100 : 1;

    const then = new Date().getTime();
    const logTitle = '##### Encrypt, and Decrypt';
    try {
      for (let i = 0; i < repetitions; i++) {
        //# start of snippet: e3kit_sign_and_encrypt
        encryptedText = await eThree.encrypt(text, recipientPublicKey);
        //# end of snippet: e3kit_sign_and_encrypt
      }
      let time = (new Date().getTime() - then) / repetitions;
      this.log(logTitle, `Encrypted and signed: '${encryptedText}'. Took: ${time}ms`);
    } catch(err) {
      this.log(logTitle, `Failed encrypting and signing: ${err}`);
    }

    return encryptedText;
  }

  async decrypt(text: string, senderPublicKey: any) {
    const eThree = this.getEThree();

    let decryptedText = null;
    let repetitions = this.benchmarking ? 100 : 1;

    const then = new Date().getTime();
    const logTitle = '##### Encrypt, and Decrypt';
    try {
      for (let i = 0; i < repetitions; i++) {
          //# start of snippet: e3kit_decrypt_and_verify
          decryptedText = await eThree.decrypt(text, senderPublicKey);
          //# end of snippet: e3kit_decrypt_and_verify
      }
      let time = (new Date().getTime() - then)/repetitions;
      this.log(logTitle, `Decrypted and verified: '${decryptedText}'. Took: ${time}ms`);
    } catch(err) {
      this.log(logTitle, `Failed decrypting and verifying: ${err}`);
    }

    return decryptedText;
  }

  async backupPrivateKey(password: string) {
    const eThree = this.getEThree();

    const logTitle = '##### backupPrivateKey';
    try {
      //# start of snippet: e3kit_backup_private_key
      await eThree.backupPrivateKey(password);
      //# end of snippet: e3kit_backup_private_key
      this.log(logTitle, `Backed up private key`);
    } catch(err) {
      this.log(logTitle, `Failed backing up private key: ${err}`);
      if (err.name === 'CloudEntryExistsError') {
          await eThree.resetPrivateKeyBackup(password);
          this.log(logTitle, `Reset private key backup. Trying again...`);
          await this.backupPrivateKey(password);
      }
    }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const eThree = this.getEThree();

    const logTitle = '##### changePassword';
    try {
      //# start of snippet: e3kit_change_password
      await eThree.changePassword(oldPassword, newPassword);
      //# end of snippet: e3kit_change_password
      this.log(logTitle, `Changed password`);
    } catch(err) {
        this.log(logTitle, `Failed changing password: ${err}`);
    }
  }

  async restorePrivateKey(password: string) {
    const eThree = this.getEThree();

    const logTitle = '##### restorePrivateKey';
    try {
      //# start of snippet: e3kit_restore_private_key
      await eThree.restorePrivateKey(password);
      //# end of snippet: e3kit_restore_private_key
      this.log(logTitle, `Restored private key`);
    } catch(err) {
      this.log(logTitle, `Failed restoring private key: ${err}`);
      if (err.name === 'PrivateKeyAlreadyExistsError') {
        await eThree.cleanup();
        this.log(logTitle, `Cleaned up. Trying again...`);
        await this.restorePrivateKey(password);
      }
    }
  }

  async resetPrivateKeyBackup() {
    const eThree = this.getEThree();

    const logTitle = '##### resetPrivateKeyBackup';
    try {
      //# start of snippet: e3kit_reset_private_key
      await eThree.resetPrivateKeyBackup();
      //# end of snippet: e3kit_reset_private_key
      this.log(logTitle, `Reset private key backup`);
    } catch(err) {
      this.log(logTitle, `Failed resetting private key backup: ${err}`);
    }
  }

  async hasLocalPrivateKey() {
    const eThree = this.getEThree();

    //# start of snippet: e3kit_has_local_private_key
    let hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
    //# end of snippet: e3kit_has_local_private_key

    return hasLocalPrivateKey;
  }

  async rotatePrivateKey() {
    const eThree = this.getEThree();

    const logTitle = '##### rotatePrivateKey (Publish New Private Key)';
    try {
      //# start of snippet: e3kit_rotate_private_key
      await eThree.rotatePrivateKey();
      //# end of snippet: e3kit_rotate_private_key
      this.log(logTitle, `Rotated private key`);
    } catch(err) {
      this.log(logTitle, `Failed rotating private key: ${err}`);

      if (err.name === 'PrivateKeyAlreadyExistsError') {
        await eThree.cleanup();
        this.log(logTitle, `Cleaned up. Trying again...`);
        await this.rotatePrivateKey();
      }
    }
  }

  async cleanup() {
    const eThree = this.getEThree();

    const logTitle = '##### Cleanup';
    try {
      //# start of snippet: e3kit_cleanup
      await eThree.cleanup();
      //# end of snippet: e3kit_cleanup
      this.log(logTitle, `${this.email} Cleaned up (means logout)`);
    } catch(err) {
      this.log(logTitle, `Failed cleaning up: ${err}`);
    }
  }

  async unregister() {
    const eThree = this.getEThree();

    const logTitle = '##### Unregister';
    try {
      //# start of snippet: e3kit_unregister
      await eThree.unregister();
      //# end of snippet: e3kit_unregister
      this.log(logTitle, `${this.email} Unregistered`);
    } catch(err) {
      this.log(logTitle, `Failed unregistering: ${err}`);
    }
  }
}

export default Device;
