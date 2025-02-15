import UserProvider from "./user-provider";
import UserNameDisplay from "./userNameDisplay";

//const JWT_SECRET = "higfbv";

export default async function NomitatePage({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  //const cookieStore = await cookies();

  /* const { user, token } = await getUser();
  cookieStore.set("user", token!, {
    httpOnly: true,
    expires: new Date(Date.now() + 3600000),
  }); */

  //const cookieStore = await cookies();
  //const userCookie = cookieStore.get("user")?.value;

  // const user = await getOrCreateUser(userCookie);

  /*if (!cookieStore.has("user")) {
    return <div>Please login to nominate</div>;
    }*/

  return (
    <UserProvider>
      <div>
        <p>Nominate for Request with ID: {urlId}</p>
        {/*<p>User: {user?.name}</p>*/}
        <UserNameDisplay />
      </div>
    </UserProvider>
  );
}

/*async function getUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let decoded;
  try {
    decoded = jwt.verify(userCookie?.value ?? "", JWT_SECRET);
  } catch {}

  if (typeof !decoded?.id !== "number") {
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    const user = await db
      .insert(usersTable)
      .values({
        name: randomName,
      })
      .returning();
    const token = jwt.sign({ id: user[0]?.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    cookieStore.set("user", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000),
    });
    console.log(token);
    return { user: user[0], token: token };
  } else {
    const user = await db
      .select()
      .from(usersTable)
      .where("id", decoded.id)
      .limit(1);

    if (user.length === 0) {
      return;
    }

    const newToken = jwt.sign({ id: user[0]?.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    cookieStore.set("user", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000),
    });
    console.log(newToken);

    return { user: user[0], token: newToken };
  }
}*/

/*async function getOrCreateUser(userCookie?: string) {
  if (!userCookie) {
    const username = "test";
    const user = await db
      .insert(usersTable)
      .values({
        name: username,
      })
      .returning();
    return user;
  }
  const decoded = jwt.verify(userCookie, "hi");

  return userCookie;
}*/
