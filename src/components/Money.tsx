import numeral from "numeral";

interface MoneyProps {
  amount: number;
}
export const Money: React.FC<MoneyProps> = ({ amount }) => {
  return (
    <p>
      &#8369; <span>{numeral(amount).format("0,0")}</span>
      <span className="text-lg">{numeral(amount).format(".00")}</span>
    </p>
  );
};
