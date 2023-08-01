import {Container} from "@sui/deps-ioc";
import {UserService, UserServiceImpl} from "./UserService";
import {LocalStorageService, LocalStorageServiceImpl} from "@sui/lib-storage";
import {getPrivileges, getUser, hasAnyPrivilege, hasPrivilege, hasRole, isAdmin} from "./utils";

Container.bind(LocalStorageService).to(LocalStorageServiceImpl);

const userService = new UserServiceImpl({
  ROLE1: [
    {
      key: "a"
    },
    {
      key: "b"
    }
  ],
  ROLE2: [
    {
      key: "a"
    },
    {
      key: "c"
    }
  ],
  ROLE3: [
    {
      key: "d"
    }
  ]
});
Container.bind(UserService).factory(() => userService);

const user = {
  id: "1",
  name: "1",
  accessToken: "1",
  // ROLE4 - without permissions
  roles: ["ROLE1", "ROLE2", "ROLE4"]
};

describe("UserService", () => {

  test("Error without user", () => {
    expect(() => userService.getUser()).toThrow("User not initialized");

    expect(() => getUser()).toThrow("User not initialized");
  });

  test("Login", () => {
    userService.login(user);
    expect(userService.getUser()).toBeDefined();

    expect(getUser()).toBeDefined();
    expect(userService.getToken()).toBe("1");
  });

  test("Has role", () => {
    userService.login(user);
    expect(userService.hasRole("ROLE1")).toBe(true);
    expect(userService.hasRole("ROLE3")).toBe(false);

    expect(hasRole("ROLE1")).toBe(true);
    expect(hasRole("ROLE3")).toBe(false);
  });

  test("Is admin", () => {
    userService.login(user);
    expect(userService.isAdmin()).toBe(false);

    expect(isAdmin()).toBe(false);

    userService.login({
      ...user,
      roles: [...user.roles, "ADMIN"]
    });
    expect(userService.isAdmin()).toBe(true);

    expect(isAdmin()).toBe(true);
  });

  test("Has privilege", () => {
    userService.login(user);
    expect(userService.hasPrivilege("a")).toBe(true);
    expect(userService.hasPrivilege("d")).toBe(false);

    expect(hasPrivilege("a")).toBe(true);
    expect(hasPrivilege("d")).toBe(false);
  });

  test("Has any privilege", () => {
    userService.login(user);
    expect(userService.hasAnyPrivilege("b")).toBe(true);
    expect(userService.hasAnyPrivilege("d", "e")).toBe(false);

    expect(hasAnyPrivilege("b")).toBe(true);
    expect(hasAnyPrivilege("d", "e")).toBe(false);
  });

  test("Get privileges", () => {
    userService.login(user);
    expect(userService.getPrivileges("a").length).toBe(2);
    expect(userService.getPrivileges("d").length).toBe(0);

    expect(getPrivileges("a").length).toBe(2);
    expect(getPrivileges("d").length).toBe(0);
  });

  test("Logout", () => {
    userService.login(user);
    expect(userService.getUser()).toBeDefined();
    userService.logout(false);
    expect(() => userService.getUser()).toThrow("User not initialized");
  });
});
