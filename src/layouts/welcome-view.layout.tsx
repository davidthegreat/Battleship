import shipLogo from '../assets/battleship.png'


type Props = {
	onClickStart: () => void;
};

const WelcomeLayout = ({ onClickStart }: Props): JSX.Element => {
	return (
		<div className="absolute z-10 inset-0 w-full h-full bg-white">
			<div className="w-full h-full flex items-center justify-center flex-col">
				<h1 className="text-6xl font-bold">Welcome to Battleship!</h1>

				<div className="mt-12">
					<img src={shipLogo} width={400} />
				</div>

				<div className="mt-12">
					<button
						className="text-2xl py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-800 hover:cursor-pointer"
						onClick={onClickStart}
					>
						start
					</button>
				</div>
			</div>
		</div>
	);
};

export default WelcomeLayout;
