import { gql, useMutation, useQuery } from "@apollo/client";
import type { InferGetServerSidePropsType, NextPage } from "next";
import { useForm } from "react-hook-form";
import client from "../apollo-client";
import {
  LoginInput,
  LoginMutation,
  LoginMutationVariables,
} from "../generated/graphql";

const LOGIN = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      ok
      token
      error
    }
  }
`;

const Home = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { register, getValues, handleSubmit, formState } = useForm<LoginInput>({
    mode: "onChange",
  });
  const onCompleted = (data: LoginMutation) => {
    const {
      login: { ok, token, error },
    } = data;
    if (ok && token) {
      alert("login success");
    } else {
      alert(error);
    }
  };
  const [login, { data: loginResult, loading }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN, { onCompleted });
  const onSubmit = () => {
    const { username, password } = getValues();
    console.log(username, password);
    login({
      variables: {
        input: { username, password },
      },
    });
  };
  return (
    <form className="flex flex-col w-20" onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="username" {...register("username")} />
      <input placeholder="password" {...register("password")} />
      <button>login</button>
    </form>
  );
};

export async function getServerSideProps() {
  const { data } = await client.query({
    query: gql`
      query findDbs {
        findDbs {
          dbs {
            id
            password
            name
          }
        }
      }
    `,
  });

  return {
    props: {
      data,
    },
  };
}

export default Home;
