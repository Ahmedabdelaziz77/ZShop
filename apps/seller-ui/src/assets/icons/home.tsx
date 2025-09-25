export function Home(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.3em"
      height="1.3em"
      {...props}
    >
      <path
        fill={props.color}
        d="M13 9V3h8v6zM3 13V3h8v10zm10 8V11h8v10zM3 21v-6h8v6z"
      ></path>
    </svg>
  );
}
