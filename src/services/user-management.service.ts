import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasherBindings} from '../utils/keys';
import {UserWithPassword} from './../models/user-with-password.model';
import {PasswordHasher} from './bcrypt-hasher.service';
import {createSession, generateVersalId} from './versal.service';

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  /*
   * Add service methods here
   */

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const {email, password} = credentials;
    const invalidCredentialsError = 'Invalid email or password.';

    if (!email) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const foundUser = await this.userRepository.findOne({
      where: {email},
      include: ['roles'],
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );

    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.firstName) userName = `${user.firstName}`;
    if (user.lastName)
      userName = user.firstName
        ? `${userName} ${user.lastName}`
        : `${user.lastName}`;

    const userRoles = user?.roles ?? [];
    const roles = userRoles.map(role => role.name);

    return {
      [securityId]: user.id,
      id: user.id,
      name: userName,
      roles,
    };
  }

  async createUser(userWithPassword: UserWithPassword): Promise<User> {
    const password = await this.passwordHasher.hashPassword(
      userWithPassword.password,
    );
    userWithPassword.password = password;

    const versalUserID = await generateVersalId(userWithPassword);
    userWithPassword.versalUserID = versalUserID;

    userWithPassword.DateCreated = new Date();

    const user = await this.userRepository.create(
      _.omit(userWithPassword, 'password'),
    );
    user.id = user.id.toString();
    await this.userRepository.userCredentials(user.id).create({password});
    return user;
  }

  async createVersalSession(user: User): Promise<Object> {
    return createSession(user);
  }
}
