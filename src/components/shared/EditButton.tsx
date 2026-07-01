import { Button, ButtonProps } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { JSX, RefAttributes } from "react";

const EditButton = (
  props: JSX.IntrinsicAttributes &
    ButtonProps &
    RefAttributes<HTMLButtonElement>
) => {
  return (
    <Link to="/dashboard">
      <Button {...props}>{props.children}</Button>
    </Link>
  );
};

export default EditButton;
