# AlertRx - Attention-Based Antimicrobial Resistance Intelligence

An intelligent clinical decision support system for neonatal sepsis risk assessment and antimicrobial resistance detection.

## Overview

AlertRx uses attention mechanisms to analyze maternal and neonatal clinical signals to identify patterns of antimicrobial resistance and guide antibiotic treatment decisions in neonatal care.

## Features

- **Mother-Neonate Journey**: Tracks antenatal signals, delivery markers, and neonatal risk indicators
- **Selective Attention**: Focuses on key maternal-neonatal transmission patterns
- **Sustained Attention**: Monitors clinical deterioration indicators
- **Attention Shifting**: Escalates to resistant organism protocols when needed
- **Clinical Reasoning**: Evidence-based decision support
- **Risk Scoring**: Quantitative risk assessment for treatment guidance
- **Demo Cases**: Interactive demonstration of clinical scenarios

## Installation

### Requirements
- Python 3.7+
- Streamlit 1.0+
- Pandas
- Plotly

### Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/alertrx.git
cd alertrx
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the app:
```bash
streamlit run app.py
```

The app will open at `http://localhost:8501`

## Data Files

- `alertrx_dataset2_intelligence.csv`: Patient cases with clinical intelligence
- `alertrx_dataset3_demo_cases.csv`: Demonstration cases for training and evaluation

## Usage

1. **Select a Patient**: Use the sidebar dropdown to choose a patient ID
2. **Review Clinical Data**: View the mother-neonate journey and risk assessment
3. **Check Recommendations**: Review AlertRx treatment recommendations
4. **Explore Demo Cases**: Browse the demonstration cases table

## Deployment

Deploy to Streamlit Community Cloud:

1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Click "New app"
4. Select your GitHub repo, branch, and `app.py` as the main file
5. Click "Deploy"

## License

MIT License - feel free to use this project for clinical education and research.

## Contact

For questions or feedback about AlertRx, please open an issue on GitHub.
