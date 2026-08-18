import argon2 from "argon2";

const passwordOptions = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return argon2.hash(password, passwordOptions);
}

export function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
