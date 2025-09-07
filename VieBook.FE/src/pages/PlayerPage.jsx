import React from "react";
import { useParams } from "react-router-dom";
import PlayerManager from "../layouts/PlayerManager";

export default function PlayerPage() {
  const { id } = useParams();
  return <PlayerManager bookId={id} />;
}
