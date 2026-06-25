import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="AlertRx",
    page_icon="🩺",
    layout="wide"
)

st.title("AlertRx")
st.subheader(
    "Attention-Based Antimicrobial Resistance Intelligence"
)

dataset2 = pd.read_csv(
    "alertrx_dataset2_intelligence.csv"
)

dataset3 = pd.read_csv(
    "alertrx_dataset3_demo_cases.csv"
)

# Side Bar 
with st.sidebar:
    st.title("Select Patient")
    patient_id = st.selectbox(
        "Patient ID",
        dataset2["patient_id"].unique()
    )

# Retrieve Patient 
patient = dataset2[
    dataset2["patient_id"] == patient_id
].iloc[0]

# Mother neonate journey
st.header("Mother–Neonate Journey")

st.write(
    f"""
    **Antenatal Signal:** {patient['antenatal_signal']}

    **Delivery Marker:** {patient['delivery_signal']}

    **Neonatal Risk:** {patient['neonate_signal']}

    **Treatment:** {patient['neonate_treatment']}
    """
)

# Selective Attention Panel.
st.header("Selective Attention")

st.info(
    patient['selective_attention_focus']
)

# Sustained Attention Panel
st.header("Sustained Attention")

st.success(
    patient['sustained_attention_chain']
)

# Attention Shifting Panel.
st.header("Attention Shifting")

st.warning(
    patient['attention_shifting_event']
)

# Clinical Reasoning Panel.
st.header("Clinical Reasoning")

st.write(
    patient['clinical_reasoning']
)

# Alert Recommendation Panel
st.header("AlertRx Recommendation")

st.error(
    patient['alertrx_recommendation']
)

# Resistant Origin.
st.header("Resistance Origin Story")

st.write(
    patient['resistance_origin_story']
)

# Risk Score
st.header("Risk Score")

st.metric(
    "Risk Level",
    patient['risk_score']
)

# Demo case tab
st.header("Dataset 3 Demonstration Cases")

st.dataframe(
    dataset3[
        [
            'patient_id',
            'delivery_signal',
            'neonate_signal',
            'neonate_treatment'
        ]
    ]
)

# 
